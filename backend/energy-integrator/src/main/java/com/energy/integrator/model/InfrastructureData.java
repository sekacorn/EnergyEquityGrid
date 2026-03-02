package com.energy.integrator.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "infrastructure_data")
public class InfrastructureData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String infrastructureType; // grid, microgrid, transformer, etc.

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Double capacity; // in kW

    private String status; // operational, under-maintenance, planned

    private String owner; // utility company, community, private

    @Column(columnDefinition = "TEXT")
    private String metadata;

    private LocalDateTime createdAt;

    private String uploadedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public InfrastructureData() {}

    public InfrastructureData(String infrastructureType, Double latitude, Double longitude,
                             Double capacity, String status, String owner, String metadata, String uploadedBy) {
        this.infrastructureType = infrastructureType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacity = capacity;
        this.status = status;
        this.owner = owner;
        this.metadata = metadata;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInfrastructureType() { return infrastructureType; }
    public void setInfrastructureType(String infrastructureType) { this.infrastructureType = infrastructureType; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
}
