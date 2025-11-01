"""
Genetic Algorithm for Classroom Seating Optimization
Uses DEAP (Distributed Evolutionary Algorithms in Python)
"""

import random
import time
from typing import List, Dict, Tuple
from deap import base, creator, tools, algorithms
import numpy as np

from app.models.student import Student
from app.models.classroom import (
    SeatingArrangement,
    ClassroomLayout,
    Seat,
    SeatPosition,
    OptimizationObjectives,
    SeatingConstraints,
    LayoutType
)
from app.core.config import settings


class ClassroomOptimizer:
    """Genetic Algorithm-based classroom seating optimizer"""

    def __init__(
        self,
        students: List[Student],
        layout_type: LayoutType,
        rows: int,
        cols: int,
        objectives: OptimizationObjectives,
        constraints: SeatingConstraints = None
    ):
        self.students = students
        self.layout_type = layout_type
        self.rows = rows
        self.cols = cols
        self.total_seats = rows * cols
        self.objectives = objectives
        self.constraints = constraints or SeatingConstraints()

        # Create student ID to index mapping
        self.student_ids = [s.id for s in students]
        self.student_map = {s.id: s for s in students}

        # Initialize DEAP
        self._setup_deap()

    def _setup_deap(self):
        """Set up DEAP genetic algorithm framework"""
        # Create fitness class (maximize)
        if not hasattr(creator, "FitnessMax"):
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))

        # Create individual class
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMax)

        self.toolbox = base.Toolbox()

        # Register functions
        self.toolbox.register("indices", random.sample, range(len(self.students)), len(self.students))
        self.toolbox.register("individual", tools.initIterate, creator.Individual, self.toolbox.indices)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)

        # Genetic operators
        self.toolbox.register("evaluate", self._evaluate_fitness)
        self.toolbox.register("mate", tools.cxOrdered)
        self.toolbox.register("mutate", tools.mutShuffleIndexes, indpb=0.2)
        self.toolbox.register("select", tools.selTournament, tournsize=3)

    def _create_layout(self, arrangement: List[int]) -> ClassroomLayout:
        """Create classroom layout from arrangement"""
        seats = []
        student_index = 0

        for row in range(self.rows):
            for col in range(self.cols):
                is_front = (row == 0)
                is_near_teacher = (row < 2)  # First two rows

                position = SeatPosition(
                    row=row,
                    col=col,
                    is_front_row=is_front,
                    is_near_teacher=is_near_teacher
                )

                if student_index < len(arrangement):
                    student_idx = arrangement[student_index]
                    student_id = self.student_ids[student_idx]
                    seat = Seat(
                        position=position,
                        student_id=student_id,
                        is_empty=False
                    )
                    student_index += 1
                else:
                    seat = Seat(position=position, is_empty=True)

                seats.append(seat)

        return ClassroomLayout(
            layout_type=self.layout_type,
            rows=self.rows,
            cols=self.cols,
            total_seats=self.total_seats,
            seats=seats
        )

    def _evaluate_fitness(self, individual: List[int]) -> Tuple[float]:
        """
        Evaluate fitness of a seating arrangement
        Returns a tuple (score,) for DEAP
        """
        layout = self._create_layout(individual)

        # Calculate individual objective scores
        academic_score = self._calculate_academic_balance(layout)
        behavioral_score = self._calculate_behavioral_balance(layout)
        diversity_score = self._calculate_diversity(layout)
        special_needs_score = self._calculate_special_needs_compliance(layout)

        # Weighted combination
        total_score = (
            self.objectives.academic_balance * academic_score +
            self.objectives.behavioral_balance * behavioral_score +
            self.objectives.diversity * diversity_score +
            self.objectives.special_needs * special_needs_score
        )

        # Apply penalties for constraint violations
        penalty = self._calculate_constraint_penalties(layout)
        total_score = max(0.0, total_score - penalty)

        return (total_score,)

    def _calculate_academic_balance(self, layout: ClassroomLayout) -> float:
        """Calculate how well academic abilities are balanced"""
        scores = []

        # Check balance within rows
        for row_num in range(self.rows):
            row_seats = [s for s in layout.seats if s.position.row == row_num and not s.is_empty]
            if row_seats:
                academic_scores = [
                    self.student_map[s.student_id].academic_score
                    for s in row_seats
                ]
                # Lower variance = better balance
                variance = np.var(academic_scores) if len(academic_scores) > 1 else 0
                row_score = 1.0 / (1.0 + variance / 100.0)  # Normalize
                scores.append(row_score)

        return np.mean(scores) if scores else 0.5

    def _calculate_behavioral_balance(self, layout: ClassroomLayout) -> float:
        """Calculate behavioral balance and compatibility"""
        scores = []

        for row_num in range(self.rows):
            row_seats = [s for s in layout.seats if s.position.row == row_num and not s.is_empty]

            # Check adjacent students
            for i in range(len(row_seats) - 1):
                student1 = self.student_map[row_seats[i].student_id]
                student2 = self.student_map[row_seats[i + 1].student_id]

                # Check if they're incompatible
                if student2.id in student1.incompatible_ids:
                    scores.append(0.0)  # Bad pairing
                elif student2.id in student1.friends_ids:
                    scores.append(0.7)  # Friends - good but not perfect (might distract)
                else:
                    # Balance behavior scores
                    avg_behavior = (student1.behavior_score + student2.behavior_score) / 2
                    scores.append(avg_behavior / 100.0)

        return np.mean(scores) if scores else 0.5

    def _calculate_diversity(self, layout: ClassroomLayout) -> float:
        """Calculate diversity (gender, language, culture)"""
        scores = []

        for row_num in range(self.rows):
            row_seats = [s for s in layout.seats if s.position.row == row_num and not s.is_empty]
            if len(row_seats) < 2:
                continue

            # Gender diversity
            genders = [self.student_map[s.student_id].gender for s in row_seats]
            unique_genders = len(set(genders))
            gender_diversity = min(unique_genders / 2.0, 1.0)

            # Language diversity
            languages = [
                self.student_map[s.student_id].primary_language
                for s in row_seats
                if self.student_map[s.student_id].primary_language
            ]
            lang_diversity = len(set(languages)) / max(len(languages), 1) if languages else 0.5

            row_diversity = (gender_diversity + lang_diversity) / 2
            scores.append(row_diversity)

        return np.mean(scores) if scores else 0.5

    def _calculate_special_needs_compliance(self, layout: ClassroomLayout) -> float:
        """Check if special needs are accommodated"""
        compliance_scores = []

        for student in self.students:
            if not student.special_needs and not student.requires_front_row:
                continue  # No special needs

            # Find student's seat
            student_seat = next(
                (s for s in layout.seats if s.student_id == student.id),
                None
            )

            if not student_seat:
                compliance_scores.append(0.0)
                continue

            score = 1.0

            # Check front row requirement
            if student.requires_front_row and not student_seat.position.is_front_row:
                score -= 0.5

            # Check quiet area requirement
            if student.requires_quiet_area:
                # Students in back or corners are quieter
                if student_seat.position.row < self.rows // 2:
                    score -= 0.3

            compliance_scores.append(max(0.0, score))

        return np.mean(compliance_scores) if compliance_scores else 1.0

    def _calculate_constraint_penalties(self, layout: ClassroomLayout) -> float:
        """Calculate penalty for violating constraints"""
        penalty = 0.0

        # Check separation constraints
        for pair in self.constraints.separate_student_pairs:
            if len(pair) != 2:
                continue
            student1_seat = next((s for s in layout.seats if s.student_id == pair[0]), None)
            student2_seat = next((s for s in layout.seats if s.student_id == pair[1]), None)

            if student1_seat and student2_seat:
                # Check if they're adjacent (same row, adjacent columns)
                if (student1_seat.position.row == student2_seat.position.row and
                    abs(student1_seat.position.col - student2_seat.position.col) == 1):
                    penalty += 0.3  # Heavy penalty for sitting next to each other

        return penalty

    def optimize(self, max_generations: int = None) -> SeatingArrangement:
        """
        Run genetic algorithm optimization
        Returns the best seating arrangement found
        """
        start_time = time.time()

        # Get settings
        pop_size = settings.GA_POPULATION_SIZE
        n_gen = max_generations or settings.GA_GENERATIONS
        cx_prob = settings.GA_CROSSOVER_RATE
        mut_prob = settings.GA_MUTATION_RATE

        # Create initial population
        population = self.toolbox.population(n=pop_size)

        # Statistics
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean)
        stats.register("max", np.max)

        # Run evolution
        population, logbook = algorithms.eaSimple(
            population,
            self.toolbox,
            cxpb=cx_prob,
            mutpb=mut_prob,
            ngen=n_gen,
            stats=stats,
            verbose=False
        )

        # Get best individual
        best_individual = tools.selBest(population, k=1)[0]
        best_fitness = best_individual.fitness.values[0]

        # Create final layout
        final_layout = self._create_layout(best_individual)

        # Calculate individual objective scores for the best solution
        academic_score = self._calculate_academic_balance(final_layout)
        behavioral_score = self._calculate_behavioral_balance(final_layout)
        diversity_score = self._calculate_diversity(final_layout)
        special_needs_score = self._calculate_special_needs_compliance(final_layout)

        # Create student-to-seat mapping
        student_seats = {}
        for seat in final_layout.seats:
            if not seat.is_empty:
                student_seats[seat.student_id] = seat.position

        computation_time = time.time() - start_time

        return SeatingArrangement(
            layout=final_layout,
            student_seats=student_seats,
            fitness_score=best_fitness,
            objective_scores={
                "academic_balance": academic_score,
                "behavioral_balance": behavioral_score,
                "diversity": diversity_score,
                "special_needs": special_needs_score
            },
            generation_count=n_gen,
            computation_time=computation_time,
            warnings=[]
        )
