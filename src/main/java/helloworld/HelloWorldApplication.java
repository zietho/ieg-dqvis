package helloworld;

import data.DataDAO;
import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import prefuse.data.io.DataIOException;
import resources.HelloWorldResource;
import healthcheck.TemplateHealthCheck;
import org.eclipse.jetty.servlets.CrossOriginFilter;
import resources.TimeBenchRessource;
import timeBench.data.TemporalDataException;
import timeBench.data.TemporalDataset;

import javax.servlet.DispatcherType;
import javax.xml.bind.JAXBException;
import java.io.IOException;
import java.util.EnumSet;

public class HelloWorldApplication extends Application<HelloWorldConfiguration> {
    public static void main(String[] args) throws Exception {
        new HelloWorldApplication().run(args);
    }
    public TemporalDataset drillingData = null; //create empty temp ds


    @Override
    public String getName() {
        return "hello-world";
    }

    @Override
    public void initialize(Bootstrap<HelloWorldConfiguration> bootstrap) {

        //set paths for data
        final String data = "src/main/resources/data/01_raw_data_set1_preprocessed_markus.csv";
        final String spec = "src/main/resources/data/spec2.xml";

        try {
            DataDAO dataDAO = new DataDAO(data,spec); //define
            drillingData = dataDAO.read();
            System.out.println("finished");
        } catch (DataIOException e) {
            e.printStackTrace();
        } catch (TemporalDataException e) {
            e.printStackTrace();
        } catch (JAXBException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    @Override
    public void run(HelloWorldConfiguration configuration,
                    Environment environment) {
        final HelloWorldResource resource = new HelloWorldResource(
                configuration.getTemplate(),
                configuration.getDefaultName()
        );

        final TimeBenchRessource tbResource = new TimeBenchRessource(drillingData);
        final TemplateHealthCheck healthCheck = new TemplateHealthCheck(configuration.getTemplate());

        environment.healthChecks().register("template", healthCheck);
        environment.jersey().register(resource);
        environment.jersey().register(tbResource);
        environment.servlets().addFilter("CrossOriginFilter", new CrossOriginFilter()).addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), true, "/*");
        environment.servlets().setInitParameter("allowedOrigins", "*");
        environment.servlets().setInitParameter("allowedHeaders", "X-Requested-With,Content-Type,Accept,Origin,Access-Control-Request-Method,Authorization,Access-Control-Request-Method");
        environment.servlets().setInitParameter("allowedMethods", "OPTIONS,GET,PUT,POST,DELETE,HEAD");
    }

}

