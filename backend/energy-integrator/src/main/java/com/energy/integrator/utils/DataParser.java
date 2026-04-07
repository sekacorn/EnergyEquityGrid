package com.energy.integrator.utils;

import com.energy.integrator.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataParser {

    private static final Logger logger = LoggerFactory.getLogger(DataParser.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<EnergyData> parseEnergyData(MultipartFile file, String fileType, String username) throws IOException {
        List<EnergyData> dataList = new ArrayList<>();

        if ("csv".equals(fileType)) {
            dataList = parseEnergyCSV(file, username);
        } else if ("json".equals(fileType)) {
            dataList = parseEnergyJSON(file, username);
        } else if ("geojson".equals(fileType)) {
            dataList = parseEnergyGeoJSON(file, username);
        }

        return dataList;
    }

    public List<CommunityData> parseCommunityData(MultipartFile file, String fileType, String username) throws IOException {
        List<CommunityData> dataList = new ArrayList<>();

        if ("csv".equals(fileType)) {
            dataList = parseCommunityCSV(file, username);
        } else if ("json".equals(fileType) || "geojson".equals(fileType)) {
            dataList = parseCommunityJSON(file, username);
        }

        return dataList;
    }

    public List<InfrastructureData> parseInfrastructureData(MultipartFile file, String fileType, String username) throws IOException {
        List<InfrastructureData> dataList = new ArrayList<>();

        if ("csv".equals(fileType)) {
            dataList = parseInfrastructureCSV(file, username);
        } else if ("json".equals(fileType)) {
            dataList = parseInfrastructureJSON(file, username);
        }

        return dataList;
    }

    private List<EnergyData> parseEnergyCSV(MultipartFile file, String username) throws IOException {
        List<EnergyData> dataList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord record : csvParser) {
                try {
                    EnergyData data = new EnergyData();
                    data.setSource(record.get("source"));
                    data.setEnergyType(record.get("energyType"));
                    data.setLatitude(Double.parseDouble(record.get("latitude")));
                    data.setLongitude(Double.parseDouble(record.get("longitude")));
                    data.setPotential(record.isMapped("potential") ? Double.parseDouble(record.get("potential")) : null);
                    data.setCurrentCapacity(record.isMapped("currentCapacity") ? Double.parseDouble(record.get("currentCapacity")) : null);
                    data.setUploadedBy(username);
                    dataList.add(data);
                } catch (IllegalArgumentException | IllegalStateException e) {
                    logger.warn("Skipping malformed energy CSV row {}: {}", record.getRecordNumber(), e.getMessage());
                }
            }
        }

        return dataList;
    }

    private List<EnergyData> parseEnergyJSON(MultipartFile file, String username) throws IOException {
        List<EnergyData> dataList = new ArrayList<>();
        JsonNode rootNode = objectMapper.readTree(file.getInputStream());

        if (rootNode.isArray()) {
            for (JsonNode node : rootNode) {
                EnergyData data = createEnergyDataFromJson(node, username);
                if (data != null) dataList.add(data);
            }
        } else {
            EnergyData data = createEnergyDataFromJson(rootNode, username);
            if (data != null) dataList.add(data);
        }

        return dataList;
    }

    private List<EnergyData> parseEnergyGeoJSON(MultipartFile file, String username) throws IOException {
        List<EnergyData> dataList = new ArrayList<>();
        JsonNode rootNode = objectMapper.readTree(file.getInputStream());
        JsonNode features = rootNode.get("features");

        if (features != null && features.isArray()) {
            for (JsonNode feature : features) {
                JsonNode geometry = feature.get("geometry");
                JsonNode properties = feature.get("properties");

                if (geometry == null || properties == null) {
                    logger.warn("Skipping GeoJSON feature with missing geometry or properties");
                    continue;
                }

                JsonNode coordinates = geometry.get("coordinates");
                if (coordinates == null || !coordinates.isArray() || coordinates.size() < 2) {
                    logger.warn("Skipping GeoJSON feature with missing or invalid coordinates");
                    continue;
                }

                EnergyData data = new EnergyData();
                data.setLongitude(coordinates.get(0).asDouble());
                data.setLatitude(coordinates.get(1).asDouble());
                data.setSource(properties.has("source") ? properties.get("source").asText() : "GeoJSON");
                data.setEnergyType(properties.has("energyType") ? properties.get("energyType").asText() : "unknown");
                data.setPotential(properties.has("potential") ? properties.get("potential").asDouble() : null);
                data.setUploadedBy(username);
                dataList.add(data);
            }
        }

        return dataList;
    }

    private List<CommunityData> parseCommunityCSV(MultipartFile file, String username) throws IOException {
        List<CommunityData> dataList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord record : csvParser) {
                try {
                    CommunityData data = new CommunityData();
                    data.setCommunityName(record.get("communityName"));
                    data.setLatitude(Double.parseDouble(record.get("latitude")));
                    data.setLongitude(Double.parseDouble(record.get("longitude")));
                    data.setPopulation(record.isMapped("population") ? Integer.parseInt(record.get("population")) : null);
                    data.setEnergyDemand(record.isMapped("energyDemand") ? Double.parseDouble(record.get("energyDemand")) : null);
                    data.setHasGridAccess(record.isMapped("hasGridAccess") ? Boolean.parseBoolean(record.get("hasGridAccess")) : false);
                    data.setUploadedBy(username);
                    dataList.add(data);
                } catch (IllegalArgumentException | IllegalStateException e) {
                    logger.warn("Skipping malformed community CSV row {}: {}", record.getRecordNumber(), e.getMessage());
                }
            }
        }

        return dataList;
    }

    private List<CommunityData> parseCommunityJSON(MultipartFile file, String username) throws IOException {
        List<CommunityData> dataList = new ArrayList<>();
        JsonNode rootNode = objectMapper.readTree(file.getInputStream());

        if (rootNode.has("type") && "FeatureCollection".equals(rootNode.get("type").asText())) {
            JsonNode features = rootNode.get("features");
            if (features != null && features.isArray()) {
                for (JsonNode feature : features) {
                    CommunityData data = createCommunityDataFromGeoJSON(feature, username);
                    if (data != null) dataList.add(data);
                }
            }
        } else if (rootNode.isArray()) {
            for (JsonNode node : rootNode) {
                CommunityData data = createCommunityDataFromJson(node, username);
                if (data != null) dataList.add(data);
            }
        }

        return dataList;
    }

    private List<InfrastructureData> parseInfrastructureCSV(MultipartFile file, String username) throws IOException {
        List<InfrastructureData> dataList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord record : csvParser) {
                try {
                    InfrastructureData data = new InfrastructureData();
                    data.setInfrastructureType(record.get("infrastructureType"));
                    data.setLatitude(Double.parseDouble(record.get("latitude")));
                    data.setLongitude(Double.parseDouble(record.get("longitude")));
                    data.setCapacity(record.isMapped("capacity") ? Double.parseDouble(record.get("capacity")) : null);
                    data.setStatus(record.isMapped("status") ? record.get("status") : "unknown");
                    data.setOwner(record.isMapped("owner") ? record.get("owner") : null);
                    data.setUploadedBy(username);
                    dataList.add(data);
                } catch (IllegalArgumentException | IllegalStateException e) {
                    logger.warn("Skipping malformed infrastructure CSV row {}: {}", record.getRecordNumber(), e.getMessage());
                }
            }
        }

        return dataList;
    }

    private List<InfrastructureData> parseInfrastructureJSON(MultipartFile file, String username) throws IOException {
        List<InfrastructureData> dataList = new ArrayList<>();
        JsonNode rootNode = objectMapper.readTree(file.getInputStream());

        if (rootNode.isArray()) {
            for (JsonNode node : rootNode) {
                InfrastructureData data = createInfrastructureDataFromJson(node, username);
                if (data != null) dataList.add(data);
            }
        } else {
            InfrastructureData data = createInfrastructureDataFromJson(rootNode, username);
            if (data != null) dataList.add(data);
        }

        return dataList;
    }

    private EnergyData createEnergyDataFromJson(JsonNode node, String username) {
        if (!node.has("source") || !node.has("energyType") || !node.has("latitude") || !node.has("longitude")) {
            logger.warn("Skipping energy JSON record missing required fields (source, energyType, latitude, longitude)");
            return null;
        }

        EnergyData data = new EnergyData();
        data.setSource(node.get("source").asText());
        data.setEnergyType(node.get("energyType").asText());
        data.setLatitude(node.get("latitude").asDouble());
        data.setLongitude(node.get("longitude").asDouble());
        data.setPotential(node.has("potential") ? node.get("potential").asDouble() : null);
        data.setCurrentCapacity(node.has("currentCapacity") ? node.get("currentCapacity").asDouble() : null);
        data.setUploadedBy(username);
        return data;
    }

    private CommunityData createCommunityDataFromJson(JsonNode node, String username) {
        if (!node.has("communityName") || !node.has("latitude") || !node.has("longitude")) {
            logger.warn("Skipping community JSON record missing required fields (communityName, latitude, longitude)");
            return null;
        }

        CommunityData data = new CommunityData();
        data.setCommunityName(node.get("communityName").asText());
        data.setLatitude(node.get("latitude").asDouble());
        data.setLongitude(node.get("longitude").asDouble());
        data.setPopulation(node.has("population") ? node.get("population").asInt() : null);
        data.setEnergyDemand(node.has("energyDemand") ? node.get("energyDemand").asDouble() : null);
        data.setHasGridAccess(node.has("hasGridAccess") ? node.get("hasGridAccess").asBoolean() : false);
        data.setUploadedBy(username);
        return data;
    }

    private CommunityData createCommunityDataFromGeoJSON(JsonNode feature, String username) {
        JsonNode geometry = feature.get("geometry");
        JsonNode properties = feature.get("properties");

        if (geometry == null || properties == null) {
            logger.warn("Skipping community GeoJSON feature with missing geometry or properties");
            return null;
        }

        JsonNode coordinates = geometry.get("coordinates");
        if (coordinates == null || !coordinates.isArray() || coordinates.size() < 2) {
            logger.warn("Skipping community GeoJSON feature with missing or invalid coordinates");
            return null;
        }

        CommunityData data = new CommunityData();
        data.setLongitude(coordinates.get(0).asDouble());
        data.setLatitude(coordinates.get(1).asDouble());
        data.setCommunityName(properties.has("name") ? properties.get("name").asText() : "Unknown");
        data.setPopulation(properties.has("population") ? properties.get("population").asInt() : null);
        data.setEnergyDemand(properties.has("energyDemand") ? properties.get("energyDemand").asDouble() : null);
        data.setGeojsonData(feature.toString());
        data.setUploadedBy(username);
        return data;
    }

    private InfrastructureData createInfrastructureDataFromJson(JsonNode node, String username) {
        if (!node.has("infrastructureType") || !node.has("latitude") || !node.has("longitude")) {
            logger.warn("Skipping infrastructure JSON record missing required fields (infrastructureType, latitude, longitude)");
            return null;
        }

        InfrastructureData data = new InfrastructureData();
        data.setInfrastructureType(node.get("infrastructureType").asText());
        data.setLatitude(node.get("latitude").asDouble());
        data.setLongitude(node.get("longitude").asDouble());
        data.setCapacity(node.has("capacity") ? node.get("capacity").asDouble() : null);
        data.setStatus(node.has("status") ? node.get("status").asText() : "unknown");
        data.setOwner(node.has("owner") ? node.get("owner").asText() : null);
        data.setUploadedBy(username);
        return data;
    }
}
