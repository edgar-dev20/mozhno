package dev.mozhno.client;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class ClientInstance {
    private Long id;
    private Integer projectId;
    private Integer environmentId;
    private Integer apiKeyId;
    private String appName;
    private String instanceId;
    private String appType;
    private String sdkVersion;
    private String keyType;
    private Instant firstSeenAt;
    private Instant lastSeenAt;
}
