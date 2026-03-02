package com.energy.integrator.service;

import com.energy.integrator.model.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test suite for DataIntegrationService
 * Tests data upload, validation, and integration functionality
 */
@SpringBootTest
@ActiveProfiles("test")
public class DataIntegrationServiceTest {

    @Autowired
    private DataIntegrationService dataIntegrationService;

    @MockBean
    private EnergyDataRepository energyDataRepository;

    @MockBean
    private CommunityDataRepository communityDataRepository;

    @MockBean
    private InfrastructureDataRepository infrastructureDataRepository;

    private MockMultipartFile energyCsvFile;
    private MockMultipartFile energyJsonFile;

    @BeforeEach
    void setUp() {
        // Sample CSV data
        String csvContent = "source,energyType,latitude,longitude,potential,currentCapacity\n" +
                          "NREL,solar,40.7128,-74.0060,850,500\n" +
                          "IRENA,wind,51.5074,-0.1278,650,400\n";

        energyCsvFile = new MockMultipartFile(
            "file",
            "energy_data.csv",
            "text/csv",
            csvContent.getBytes()
        );

        // Sample JSON data
        String jsonContent = "[{" +
            "\"source\":\"NREL\"," +
            "\"energyType\":\"solar\"," +
            "\"latitude\":40.7128," +
            "\"longitude\":-74.0060," +
            "\"potential\":850," +
            "\"currentCapacity\":500" +
            "}]";

        energyJsonFile = new MockMultipartFile(
            "file",
            "energy_data.json",
            "application/json",
            jsonContent.getBytes()
        );
    }

    @Test
    void testUploadEnergyDataCSV_Success() throws IOException {
        when(energyDataRepository.saveAll(any())).thenReturn(java.util.List.of(new EnergyData()));

        Map<String, Object> result = dataIntegrationService.uploadEnergyData(energyCsvFile, "testuser");

        assertTrue((Boolean) result.get("success"));
        assertNotNull(result.get("recordsProcessed"));
        verify(energyDataRepository, times(1)).saveAll(any());
    }

    @Test
    void testUploadEnergyDataJSON_Success() throws IOException {
        when(energyDataRepository.saveAll(any())).thenReturn(java.util.List.of(new EnergyData()));

        Map<String, Object> result = dataIntegrationService.uploadEnergyData(energyJsonFile, "testuser");

        assertTrue((Boolean) result.get("success"));
        assertEquals("Energy data uploaded successfully", result.get("message"));
    }

    @Test
    void testGetIntegratedData_ReturnsData() {
        when(energyDataRepository.findByLocationRange(any(), any(), any(), any()))
            .thenReturn(java.util.List.of(new EnergyData()));
        when(communityDataRepository.findByLocationRange(any(), any(), any(), any()))
            .thenReturn(java.util.List.of(new CommunityData()));
        when(infrastructureDataRepository.findByLocationRange(any(), any(), any(), any()))
            .thenReturn(java.util.List.of(new InfrastructureData()));

        Map<String, Object> result = dataIntegrationService.getIntegratedData(40.7128, -74.0060, 50.0);

        assertNotNull(result);
        assertTrue(result.containsKey("energyData"));
        assertTrue(result.containsKey("communityData"));
        assertTrue(result.containsKey("infrastructureData"));
    }
}
