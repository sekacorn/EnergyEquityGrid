package com.energy.integrator.service;

import com.energy.integrator.model.*;
import com.energy.integrator.utils.DataParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class DataIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(DataIntegrationService.class);

    @Autowired
    private EnergyDataRepository energyDataRepository;

    @Autowired
    private CommunityDataRepository communityDataRepository;

    @Autowired
    private InfrastructureDataRepository infrastructureDataRepository;

    @Autowired
    private DataParser dataParser;

    public Map<String, Object> uploadEnergyData(MultipartFile file, String username) throws IOException {
        logger.info("Processing energy data upload from user: {}", username);

        String filename = file.getOriginalFilename();
        String fileType = getFileExtension(filename);

        List<EnergyData> energyDataList = dataParser.parseEnergyData(file, fileType, username);
        List<EnergyData> savedData = energyDataRepository.saveAll(energyDataList);

        logger.info("Saved {} energy data records", savedData.size());

        return Map.of(
            "success", true,
            "recordsProcessed", savedData.size(),
            "message", "Energy data uploaded successfully"
        );
    }

    public Map<String, Object> uploadCommunityData(MultipartFile file, String username) throws IOException {
        logger.info("Processing community data upload from user: {}", username);

        String filename = file.getOriginalFilename();
        String fileType = getFileExtension(filename);

        List<CommunityData> communityDataList = dataParser.parseCommunityData(file, fileType, username);
        List<CommunityData> savedData = communityDataRepository.saveAll(communityDataList);

        logger.info("Saved {} community data records", savedData.size());

        return Map.of(
            "success", true,
            "recordsProcessed", savedData.size(),
            "message", "Community data uploaded successfully"
        );
    }

    public Map<String, Object> uploadInfrastructureData(MultipartFile file, String username) throws IOException {
        logger.info("Processing infrastructure data upload from user: {}", username);

        String filename = file.getOriginalFilename();
        String fileType = getFileExtension(filename);

        List<InfrastructureData> infraDataList = dataParser.parseInfrastructureData(file, fileType, username);
        List<InfrastructureData> savedData = infrastructureDataRepository.saveAll(infraDataList);

        logger.info("Saved {} infrastructure data records", savedData.size());

        return Map.of(
            "success", true,
            "recordsProcessed", savedData.size(),
            "message", "Infrastructure data uploaded successfully"
        );
    }

    public Map<String, Object> getIntegratedData(Double lat, Double lon, Double radius) {
        Double latRadius = radius / 111.0; // Approximate degrees
        Double lonRadius = radius / (111.0 * Math.cos(Math.toRadians(lat)));

        List<EnergyData> energyData = energyDataRepository.findByLocationRange(
            lat - latRadius, lat + latRadius, lon - lonRadius, lon + lonRadius);

        List<CommunityData> communityData = communityDataRepository.findByLocationRange(
            lat - latRadius, lat + latRadius, lon - lonRadius, lon + lonRadius);

        List<InfrastructureData> infraData = infrastructureDataRepository.findByLocationRange(
            lat - latRadius, lat + latRadius, lon - lonRadius, lon + lonRadius);

        return Map.of(
            "energyData", energyData,
            "communityData", communityData,
            "infrastructureData", infraData,
            "center", Map.of("latitude", lat, "longitude", lon),
            "radius", radius
        );
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "";
    }
}
