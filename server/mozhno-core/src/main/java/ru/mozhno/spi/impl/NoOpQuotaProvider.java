package ru.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import ru.mozhno.spi.QuotaSpi;

@Component
public class NoOpQuotaProvider implements QuotaSpi {

    @Override
    public QuotaResult canCreateFlag(Integer projectId) {
        return new Allowed();
    }

    @Override
    public QuotaResult canCreateSegment(Integer projectId) {
        return new Allowed();
    }

    @Override
    public QuotaResult canCreateContext(Integer projectId) {
        return new Allowed();
    }

    @Override
    public QuotaResult canCreateUser(Integer projectId) {
        return new Allowed();
    }

    @Override
    public QuotaResult canCreateApiKey(Integer projectId) {
        return new Allowed();
    }

    @Override
    public int getAuditRetentionDays(Integer projectId) {
        return 365;
    }
}
