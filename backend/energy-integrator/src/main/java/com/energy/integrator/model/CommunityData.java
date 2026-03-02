package com.energy.integrator.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_data")
public class CommunityData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String communityName;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Integer population;

    private Double energyDemand; // kWh per day

    private String demandProfile; // residential, commercial, industrial

    private Boolean hasGridAccess;

    @Column(columnDefinition = "TEXT")
    private String geojsonData; // GeoJSON from OpenStreetMap

    private LocalDateTime createdAt;

    private String uploadedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public CommunityData() {}

    public CommunityData(String communityName, Double latitude, Double longitude,
                        Integer population, Double energyDemand, String demandProfile,
                        Boolean hasGridAccess, String geojsonData, String uploadedBy) {
        this.communityName = communityName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.population = population;
        this.energyDemand = energyDemand;
        this.demandProfile = demandProfile;
        this.hasGridAccess = hasGridAccess;
        this.geojsonData = geojsonData;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getPopulation() { return population; }
    public void setPopulation(Integer population) { this.population = population; }

    public Double getEnergyDemand() { return energyDemand; }
    public void setEnergyDemand(Double energyDemand) { this.energyDemand = energyDemand; }

    public String getDemandProfile() { return demandProfile; }
    public void setDemandProfile(String demandProfile) { this.demandProfile = demandProfile; }

    public Boolean getHasGridAccess() { return hasGridAccess; }
    public void setHasGridAccess(Boolean hasGridAccess) { this.hasGridAccess = hasGridAccess; }

    public String getGeojsonData() { return geojsonData; }
    public void setGeojsonData(String geojsonData) { this.geojsonData = geojsonData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
}
