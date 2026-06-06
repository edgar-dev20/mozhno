package ru.mozhno.events;

public record DomainEvent(
    Integer projectId,
    String action,
    String resourceType,
    Integer resourceId,
    String resourceName,
    String details
) {}