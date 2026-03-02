package com.energy.integrator.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InfrastructureDataRepository extends JpaRepository<InfrastructureData, Long> {

    List<InfrastructureData> findByInfrastructureType(String type);

    List<InfrastructureData> findByStatus(String status);

    @Query("SELECT i FROM InfrastructureData i WHERE i.latitude BETWEEN ?1 AND ?2 AND i.longitude BETWEEN ?3 AND ?4")
    List<InfrastructureData> findByLocationRange(Double minLat, Double maxLat, Double minLon, Double maxLon);
}
