package dev.mozhno.client;

import dev.mozhno.flags.Flag;
import dev.mozhno.flags.strategy.FlagStrategy;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response object served to SDK clients containing flag evaluation data.
 */
@Getter
@Setter
@NoArgsConstructor
public class ClientFlagResponse {
    private String name;
    private String key;
    private boolean enabled;
    private Activation activation;

    public ClientFlagResponse(Flag flag, FlagStrategy strategy, List<Constraint> constraints, List<Segment> segments) {
        this.name = flag.getName();
        this.key = flag.getKey();
        this.enabled = strategy != null ? strategy.isEnabled() : flag.isEnabled();
        if (strategy != null) {
            this.activation = new Activation(strategy.getPercentage(), constraints, segments);
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Activation {
        private Double rollOut;
        private List<Constraint> constraints;
        private List<Segment> segments;

        public Activation(Double rollOut, List<Constraint> constraints, List<Segment> segments) {
            this.rollOut = rollOut;
            this.constraints = constraints;
            this.segments = segments;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Segment {
        private String name;
        private List<Constraint> constraints;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Constraint {
        private String field;
        private String operator;
        private java.util.List<String> values;
        private String contextType;

        public Constraint(String field, String operator, java.util.List<String> values, String contextType) {
            this.field = field;
            this.operator = operator;
            this.values = values;
            this.contextType = contextType;
        }
    }
}