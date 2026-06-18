package dev.mozhno.contexts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ContextValueRequest {
    @NotNull
    private Integer contextDefinitionId;

    @Size(max = 10000)
    private String values;
}
