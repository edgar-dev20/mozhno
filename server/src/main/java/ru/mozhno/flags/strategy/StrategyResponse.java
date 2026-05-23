package ru.mozhno.flags.strategy;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StrategyResponse {
    private Integer id;
    private Integer flagId;
    private String type;
    private boolean enabled;
    private Double percentage;
    private String contextKey;
    private String segmentValue;
    private Double segmentPercentage;
    private Instant createdAt;
}