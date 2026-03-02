package com.energy.integrator.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "energy_data")
public class EnergyData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String source; // IRENA, NREL, etc.

    @NotNull
    private String energyType; // solar, wind, hydro, etc.

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Double potential; // Energy potential in kWh

    private Double currentCapacity;

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON metadata

    private LocalDateTime createdAt;

    private String uploadedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public EnergyData() {}

    public EnergyData(String source, String energyType, Double latitude, Double longitude,
                     Double potential, Double currentCapacity, String metadata, String uploadedBy) {
        this.source = source;
        this.energyType = energyType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.potential = potential;
        this.currentCapacity = currentCapacity;
        this.metadata = metadata;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getEnergyType() { return energyType; }
    public void setEnergyType(String energyType) { this.energyType = energyType; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getPotential() { return potential; }
    public void setPotential(Double potential) { this.potential = potential; }

    public Double getCurrentCapacity() { return currentCapacity; }
    public void setCurrentCapacity(Double currentCapacity) { this.currentCapacity = currentCapacity; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
}
