package ru.mozhno.client;

import ru.mozhno.flags.Flag;

import java.util.List;

public class ClientFlagResponse {
    private String name;
    private String key;
    private boolean enabled;
    private Activation activation;

    public ClientFlagResponse() {}

    public ClientFlagResponse(Flag flag, List<Constraint> constraints) {
        this.name = flag.getName();
        this.key = flag.getKey();
        this.enabled = flag.getStrategy() != null ? flag.getStrategy().isEnabled() : flag.isEnabled();
        if (flag.getStrategy() != null) {
            this.activation = new Activation(flag.getStrategy().getPercentage(), constraints);
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
        private Double rollOut;
        private List<Constraint> constraints;

        public Activation() {}

        public Activation(Double rollOut, List<Constraint> constraints) {
            this.rollOut = rollOut;
            this.constraints = constraints;
        }

        public Double getRollOut() { return rollOut; }
        public void setRollOut(Double rollOut) { this.rollOut = rollOut; }
        public List<Constraint> getConstraints() { return constraints; }
        public void setConstraints(List<Constraint> constraints) { this.constraints = constraints; }
    }

    public static class Constraint {
        private String field;
        private String operator;
        private java.util.List<String> values;

        public Constraint() {}

        public Constraint(String field, String operator, java.util.List<String> values) {
            this.field = field;
            this.operator = operator;
            this.values = values;
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public java.util.List<String> getValues() { return values; }
        public void setValues(java.util.List<String> values) { this.values = values; }
    }
}