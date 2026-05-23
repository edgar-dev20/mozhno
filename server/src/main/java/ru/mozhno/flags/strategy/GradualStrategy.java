package ru.mozhno.flags.strategy;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("GRADUAL")
public class GradualStrategy extends FlagStrategy {
    @Column
    private Double percentage;

    @Override
    public String getStrategyType() { return "GRADUAL"; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
}