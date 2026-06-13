package dev.mozhno.tags;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Schema(description = "Request body for creating or updating a tag")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TagRequest {
    @Schema(description = "Project ID")
    private Integer projectId;

    @NotBlank @Size(max = 255)
    @Schema(description = "Tag name", example = "Performance")
    private String name;

    @Size(max = 1000)
    @Schema(description = "Optional description", nullable = true)
    private String description;

    @Size(max = 50)
    @Schema(description = "Color hex code", example = "#ff0000")
    private String color;
}