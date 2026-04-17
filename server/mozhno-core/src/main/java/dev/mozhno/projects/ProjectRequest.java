package dev.mozhno.projects;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Schema(description = "Request body for creating or updating a project")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {
    @NotBlank @Size(max = 255)
    @Schema(description = "Project name", example = "My Project")
    private String name;

    @Size(max = 1000)
    @Schema(description = "Optional description", nullable = true)
    private String description;
}