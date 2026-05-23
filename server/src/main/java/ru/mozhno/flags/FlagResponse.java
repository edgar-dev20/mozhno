package ru.mozhno.flags;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlagResponse {
    private Integer id;
    private Integer projectId;
    private String name;
    private String key;
    private String description;
    private Instant createdAt;
}