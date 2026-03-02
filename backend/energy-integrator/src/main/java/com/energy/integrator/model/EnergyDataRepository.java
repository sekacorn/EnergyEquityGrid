package com.energy.integrator.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnergyDataRepository extends JpaRepository<EnergyData, Long> {

    List<EnergyData> findByEnergyType(String energyType);

    @Query("SELECT e FROM EnergyData e WHERE e.latitude BETWEEN ?1 AND ?2 AND e.longitude BETWEEN ?3 AND ?4")
    List<EnergyData> findByLocationRange(Double minLat, Double maxLat, Double minLon, Double maxLon);

    List<EnergyData> findByUploadedBy(String username);
}
