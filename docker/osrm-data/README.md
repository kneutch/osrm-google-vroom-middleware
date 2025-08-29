# OSRM Data Setup

This directory should contain processed OSRM map data.

## To set up OSRM data:

1. Download an OSM extract (e.g., from Geofabrik):
   ```bash
   wget http://download.geofabrik.de/north-america/us/massachusetts-latest.osm.pbf
   ```

2. Process the data with OSRM:
   ```bash
   # Extract
   docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/massachusetts-latest.osm.pbf

   # Partition  
   docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/massachusetts-latest.osrm

   # Customize
   docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/massachusetts-latest.osrm
   ```

3. The processed files should be placed in this directory with the naming convention:
   - map.osrm
   - map.osrm.cell_metrics
   - map.osrm.cells
   - map.osrm.cnbg
   - map.osrm.cnbg_to_ebg
   - map.osrm.ebg
   - map.osrm.ebg_nodes
   - map.osrm.enw
   - map.osrm.geometry
   - map.osrm.icd
   - map.osrm.mldgr
   - map.osrm.names
   - map.osrm.nbg_nodes
   - map.osrm.properties
   - map.osrm.ramIndex
   - map.osrm.timestamp

Note: You can also use the pre-built demo data by downloading a small area extract for testing.