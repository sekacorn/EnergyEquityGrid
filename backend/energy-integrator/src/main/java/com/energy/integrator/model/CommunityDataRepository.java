package com.energy.integrator.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunityDataRepository extends JpaRepository<CommunityData, Long> {

    List<CommunityData> findByCommunityName(String communityName);

    @Query("SELECT c FROM CommunityData c WHERE c.latitude BETWEEN ?1 AND ?2 AND c.longitude BETWEEN ?3 AND ?4")
    List<CommunityData> findByLocationRange(Double minLat, Double maxLat, Double minLon, Double maxLon);

    List<CommunityData> findByHasGridAccess(Boolean hasGridAccess);
}
