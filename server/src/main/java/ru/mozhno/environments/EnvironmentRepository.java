package ru.mozhno.environments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, Integer> {
    List<Environment> findByProjectId(Integer projectId);
}