package ru.mozhno.flags;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FlagTagValueRepository extends JpaRepository<FlagTagValue, Integer> {
    @Query("SELECT ftv FROM FlagTagValue ftv WHERE ftv.flag.id = :flagId")
    List<FlagTagValue> findByFlagId(@Param("flagId") Integer flagId);

    @Query("SELECT ftv FROM FlagTagValue ftv WHERE ftv.flag.id = :flagId AND ftv.tag.id = :tagId")
    FlagTagValue findByFlagIdAndTagId(@Param("flagId") Integer flagId, @Param("tagId") Integer tagId);

    void deleteByFlagId(Integer flagId);
}