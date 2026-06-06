package ru.mozhno.spi;

public interface QuotaSpi {

    QuotaResult canCreateFlag(Integer projectId);

    QuotaResult canCreateSegment(Integer projectId);

    QuotaResult canCreateContext(Integer projectId);

    QuotaResult canCreateUser(Integer projectId);

    QuotaResult canCreateApiKey(Integer projectId);

    int getAuditRetentionDays(Integer projectId);

    sealed interface QuotaResult permits Allowed, Blocked {}

    record Allowed() implements QuotaResult {}

    record Blocked(String resourceType, int current, int limit, String planName) implements QuotaResult {}
}
