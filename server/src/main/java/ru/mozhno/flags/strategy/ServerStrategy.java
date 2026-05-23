package ru.mozhno.flags.strategy;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SERVER")
public class ServerStrategy extends FlagStrategy {
    @Override
    public String getStrategyType() { return "SERVER"; }
}