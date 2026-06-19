package dev.mozhno.client;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClientFlagResponseTest {
    @Test
    void defaultConstructor_shouldWork() {
        var r = new ClientFlagResponse();
        assertThat(r.getName()).isNull();
    }

    @Test
    void settersGetters_shouldWork() {
        var r = new ClientFlagResponse();
        r.setName("test");
        r.setKey("test-key");
        r.setEnabled(true);

        assertThat(r.getName()).isEqualTo("test");
        assertThat(r.getKey()).isEqualTo("test-key");
        assertThat(r.isEnabled()).isTrue();
    }

    @Test
    void activationSetters_shouldWork() {
        var a = new ClientFlagResponse.Activation();
        a.setRollOut(50.0);
        a.setConstraints(List.of());

        assertThat(a.getRollOut()).isEqualTo(50.0);
        assertThat(a.getConstraints()).isEmpty();
    }

    @Test
    void constraintSetters_shouldWork() {
        var c = new ClientFlagResponse.Constraint();
        c.setField("userId");
        c.setOperator("in");
        c.setValues(List.of("user-1", "user-2"));

        assertThat(c.getField()).isEqualTo("userId");
        assertThat(c.getOperator()).isEqualTo("in");
        assertThat(c.getValues()).containsExactly("user-1", "user-2");
    }

    @Test
    void activationDefaultConstructor_shouldHaveNullFields() {
        var a = new ClientFlagResponse.Activation();
        assertThat(a.getRollOut()).isNull();
        assertThat(a.getConstraints()).isNull();
    }

    @Test
    void constraintDefaultConstructor_shouldHaveNullFields() {
        var c = new ClientFlagResponse.Constraint();
        assertThat(c.getField()).isNull();
        assertThat(c.getOperator()).isNull();
        assertThat(c.getValues()).isNull();
    }

    @Test
    void activationWithConstructor_shouldWork() {
        var a = new ClientFlagResponse.Activation(30.0, null, null);
        assertThat(a.getRollOut()).isEqualTo(30.0);
        assertThat(a.getConstraints()).isNull();
    }

    @Test
    void constraintWithConstructor_shouldWork() {
        var c = new ClientFlagResponse.Constraint("email", "eq", List.of("a@b.c"), "string");
        assertThat(c.getField()).isEqualTo("email");
        assertThat(c.getOperator()).isEqualTo("eq");
        assertThat(c.getValues()).containsExactly("a@b.c");
        assertThat(c.getContextType()).isEqualTo("string");
    }

    @Test
    void constraintContextTypeSetters_shouldWork() {
        var c = new ClientFlagResponse.Constraint();
        c.setContextType("number");
        assertThat(c.getContextType()).isEqualTo("number");
    }
}
