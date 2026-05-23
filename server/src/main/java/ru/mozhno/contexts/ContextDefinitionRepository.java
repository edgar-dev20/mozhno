package ru.mozhno.contexts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContextDefinitionRepository extends JpaRepository<ContextDefinition, Integer> {
    List<ContextDefinition> findByProjectId(Integer projectId);
}