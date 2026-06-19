package dev.mozhno.services;

import org.junit.jupiter.api.Test;
import dev.mozhno.ContextType;

import static org.junit.jupiter.api.Assertions.*;

class ContextTypeTest {

    @Test
    void fromValue_shouldResolveAllTypes() {
        assertEquals(ContextType.STRING, ContextType.fromValue("string"));
        assertEquals(ContextType.NUMBER, ContextType.fromValue("number"));
        assertEquals(ContextType.TIME, ContextType.fromValue("time"));
        assertEquals(ContextType.SEMVER, ContextType.fromValue("semver"));
    }

    @Test
    void fromValue_shouldDefaultToStringForNull() {
        assertEquals(ContextType.STRING, ContextType.fromValue(null));
    }

    @Test
    void fromValue_shouldDefaultToStringForUnknown() {
        assertEquals(ContextType.STRING, ContextType.fromValue("binary"));
    }

    @Test
    void fromValue_shouldDefaultToStringForEmpty() {
        assertEquals(ContextType.STRING, ContextType.fromValue(""));
    }

    @Test
    void getValue_shouldReturnCorrectStrings() {
        assertEquals("string", ContextType.STRING.getValue());
        assertEquals("number", ContextType.NUMBER.getValue());
        assertEquals("time", ContextType.TIME.getValue());
        assertEquals("semver", ContextType.SEMVER.getValue());
    }
}
