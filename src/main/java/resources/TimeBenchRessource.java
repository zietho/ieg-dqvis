package resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Optional;
import core.TemporalColumn;
import core.TemporalData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import prefuse.data.Schema;
import prefuse.data.column.Column;
import timeBench.data.TemporalDataset;
import timeBench.data.TemporalElement;
import timeBench.data.TemporalObject;
import timeBench.util.DebugHelper;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by evolution on 10/07/2014.
 */
@Path("/read-data")
@Produces(MediaType.APPLICATION_JSON)
public class TimeBenchRessource {
    public TemporalDataset data;
    public Logger logger = LoggerFactory.getLogger(TimeBenchRessource.class);

    public TimeBenchRessource(TemporalDataset data){
        this.data = data;
        logger.info("data works! " + data.getRootCount()+ " objects loaded!");
    }

    @GET
    @Timed
    public List<TemporalColumn> readData(@QueryParam("column") String column, @QueryParam("granularity") Optional<String> granularity){
        TemporalData temporalData = new TemporalData();

        if(column != null && !column.equals("")){
            //first get the column and convert it to an array list
            Column dataColumn = data.getTemporalObjectTable().getColumn(column);
            Column missingDataColumn = data.getTemporalObjectTable().getColumn(column+".MissingData");
            Column invalidDataColumn = data.getTemporalObjectTable().getColumn(column+".InvalidData");

            for(int i=0; i<dataColumn.getRowCount(); i++){
                double dataValue = (double) dataColumn.get(i);
                int qualityValue = (missingDataColumn.get(i).toString().equals("1") || invalidDataColumn.get(i).toString().equals("1")) ? 1 : 0;
                int dateValue = Integer.parseInt(data.getTemporalElements().getTemporalElementByRow(i).toString());

//                data.getTemporalElements().getTemporalElementByRow(i).getInf();  fuer timestmap
                TemporalColumn temporalColumn = new TemporalColumn(dateValue, dataValue, qualityValue);
                temporalData.add(temporalColumn);
            }
        }

        return temporalData.getData();
    }

}
