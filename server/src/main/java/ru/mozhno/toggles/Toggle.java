package ru.mozhno.toggles;

import lombok.Data;
import ru.mozhno.environments.Environment;

import java.time.Instant;
import java.util.Map;

@Data
public class Toggle {

    private Integer id;
    private String name;
    private String description;
    private Instant createdAt;
    private Map<Environment, ActivationRule> environmentActivationRules;

}