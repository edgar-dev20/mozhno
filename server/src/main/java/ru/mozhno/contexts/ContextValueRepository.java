package ru.mozhno.contexts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContextValueRepository extends JpaRepository<ContextValue, Integer> {
    List<ContextValue> findByContextDefinitionId(Integer contextDefinitionId);
}