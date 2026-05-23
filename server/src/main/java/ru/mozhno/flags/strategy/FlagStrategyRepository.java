package ru.mozhno.flags.strategy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlagStrategyRepository extends JpaRepository<FlagStrategy, Integer> {
    List<FlagStrategy> findByFlagId(Integer flagId);
    FlagStrategy findByFlagIdAndEnvironmentId(Integer flagId, Integer environmentId);
}