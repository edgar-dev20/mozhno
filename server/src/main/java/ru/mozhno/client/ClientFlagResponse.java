package ru.mozhno.client;

import ru.mozhno.flags.Flag;
import ru.mozhno.flags.strategy.FlagStrategy;

public class ClientFlagResponse {
    private String name;
    private String key;
    private boolean enabled;
    private Activation activation;

    public ClientFlagResponse() {}

    public ClientFlagResponse(Flag flag) {
        this.name = flag.getName();
        this.key = flag.getKey();
        FlagStrategy strategy = flag.getStrategy();
        this.enabled = strategy != null ? strategy.isEnabled() : flag.isEnabled();
        if (strategy != null) {
            this.activation = new Activation(strategy);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Activation getActivation() { return activation; }
    public void setActivation(Activation activation) { this.activation = activation; }

    public static class Activation {
        private String type;
        private Double rollOut;
        private Constraint constraint;

        public Activation() {}

        public Activation(FlagStrategy s) {
            this.type = s.getStrategyType() != null ? s.getStrategyType().toLowerCase() : "server";
            this.rollOut = "gradual".equalsIgnoreCase(s.getStrategyType()) ? s.getPercentage() : s.getRolloutPercentage();
            if (s.getContextName() != null && s.getContextValuesJson() != null) {
                this.constraint = new Constraint(s.getContextName(), s.getContextValuesJson());
            }
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Double getRollOut() { return rollOut; }
        public void setRollOut(Double rollOut) { this.rollOut = rollOut; }
        public Constraint getConstraint() { return constraint; }
        public void setConstraint(Constraint constraint) { this.constraint = constraint; }
    }

    public static class Constraint {
        private String field;
        private java.util.List<String> values;

        public Constraint() {}

        public Constraint(String field, String valuesJson) {
            this.field = field;
            try {
                this.values = new com.fasterxml.jackson.databind.ObjectMapper().readValue(valuesJson,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>() {});
            } catch (Exception e) {
                this.values = java.util.Collections.emptyList();
            }
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public java.util.List<String> getValues() { return values; }
        public void setValues(java.util.List<String> values) { this.values = values; }
    }
}