package dev.mozhno.sdk.model;

import java.util.List;

public class FeatureFlag {
    private String name;
    private String key;
    private boolean enabled;
    private Activation activation;

    public FeatureFlag() {}

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
        private java.util.List<Segment> segments;

        public Activation() {}

        public Double getRollOut() { return rollOut; }
        public void setRollOut(Double rollOut) { this.rollOut = rollOut; }
        public List<Constraint> getConstraints() { return constraints; }
        public void setConstraints(List<Constraint> constraints) { this.constraints = constraints; }
        public java.util.List<Segment> getSegments() { return segments; }
        public void setSegments(java.util.List<Segment> segments) { this.segments = segments; }
    }

    public static class Segment {
        private String name;
        private List<Constraint> constraints;

        public Segment() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<Constraint> getConstraints() { return constraints; }
        public void setConstraints(List<Constraint> constraints) { this.constraints = constraints; }
    }

    public static class Constraint {
        private String field;
        private String operator;
        private List<String> values;
        private String contextType;

        public Constraint() {}

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public List<String> getValues() { return values; }
        public void setValues(List<String> values) { this.values = values; }
        public String getContextType() { return contextType; }
        public void setContextType(String contextType) { this.contextType = contextType; }
    }
}
