package resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Optional;
import core.TemporalData;
import data.DataDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import timeBench.data.TemporalDataset;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by evolution on 10/07/2014.
 */
@Path("/get-data")
@Produces(MediaType.APPLICATION_JSON)
public class TemporalDataResource {
    public TemporalDataset data;
    final Logger logger = LoggerFactory.getLogger(TemporalDataResource.class);
    private DataDAO dataDAO;

    public TemporalDataResource(DataDAO dataDAO){
        this.dataDAO = dataDAO; //set DAO
        this.dataDAO.setAggregatedDataset(this.dataDAO.aggregate()); //pre aggregate
    }

    @GET
    @Timed
    public TemporalData readData(@QueryParam("column") List<String> columns, @QueryParam("granularity") @DefaultValue("hour") String granularity, @QueryParam("from") Optional<String> from, @QueryParam("to") Optional<String> to, @QueryParam("load") Optional<String> load, @QueryParam("indicator") List<String> indicators){
        TemporalData temporalData = new TemporalData();
        if(indicators != null){


            indicators = new ArrayList<String>();
            indicators.add(".MissingData");
            indicators.add(".InvalidData");
            indicators.add("MissingTimestamp");

        }

        //loading a single column
        if(!columns.isEmpty() && columns.size()==1) {
            if(columns.get(0).equals("all")) {

                    temporalData.add(dataDAO.readAggregated(this.getLevel(granularity), indicators));

            }else{

                    temporalData.add(dataDAO.readAggregated(columns, this.getLevel(granularity), indicators));
            }
        }
        //loading multiple columns
        else if(!columns.isEmpty() && columns.size()>1){
            //individually
            if(load.isPresent() && load.get().equals("individually")){
                for(String column:columns){

                        temporalData.add(dataDAO.readAggregated(column, this.getLevel(granularity), indicators));

                }
            }
            //aggregated
            else{

                    temporalData.add(dataDAO.readAggregated(columns, this.getLevel(granularity), indicators));

            }
        }
        //default
        else{
            temporalData.add(dataDAO.readAggregated(this.getLevel(granularity)));
        }

        return temporalData;
    }

    private int getLevel(String granularity){
        switch(granularity){
            case "minute": return 3;
            case "hour": return 2;
            case "day": return 1;
            case "top": return 0;
            default: return 3;
        }
    }


}
