package dev.mozhno.environments;

import org.springframework.stereotype.Component;

@Component
public class DefaultEnvironmentLimitProvider implements EnvironmentLimitProvider {
    @Override
    public int getMaxEnvironments() {
        return 3;
    }
}
