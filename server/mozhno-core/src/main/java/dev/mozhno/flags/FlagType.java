package dev.mozhno.flags;

/**
 * Enumeration of flag types.
 */
public enum FlagType {
    /** Standard feature release flag, rolled out gradually. */
    RELEASE,
    /** Kill switch flag, used to immediately disable a feature. */
    KILLSWITCH
}