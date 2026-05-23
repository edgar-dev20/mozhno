package ru.mozhno.flags;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlagRepository extends JpaRepository<Flag, Integer> {
    List<Flag> findByProjectId(Integer projectId);

    Optional<Flag> findByProjectIdAndKey(Integer projectId, String key);

    @Query("SELECT f FROM Flag f LEFT JOIN FETCH f.strategies WHERE f.projectId = :projectId AND f.key = :key")
    Optional<Flag> findByProjectIdAndKeyWithStrategies(@Param("projectId") Integer projectId, @Param("key") String key);
}