FROM lgelfan/centos-java17-mvn305
MAINTAINER dcotelessa

ENV TERM xterm
ENV AEM_PORT 4502
ENV AEM_ARGS=""
ENV CQ_RUNMODE="localdre,author"

#install nano and httpd
RUN yum -y update
RUN yum install -y httpd
RUN yum install -y nano
RUN yum install -y git
RUN cp /var/aem/remote/install/proxy/vhosts.conf /etc/httpd/conf/
RUN echo "Include /etc/httpd/conf/vhosts.conf" >> /etc/httpd/conf/httpd.conf
RUN service httpd start
RUN chkconfig httpd on

# set up some directories:
RUN mkdir -p /var/aem/remote
RUN mkdir -p /opt/aem/author


#Install AEM Author

WORKDIR /opt/aem/author

COPY aem/cq-quickstart-6.0.0.jar /opt/aem/author/aem-author-${AEM_PORT}.jar
COPY aem/license.properties /opt/aem/author/

RUN java -XX:MaxPermSize=256m -Xmx1024M -jar aem-author-${AEM_PORT}.jar -unpack -v $AEM_ARGS

#set mavens
RUN cp /var/aem/remote/install/maven/settings.xml /root/.m2/
RUN mvn clean install -Plocal-author

RUN mkdir -p /opt/aem/author/crx-quickstart/install
RUN cp /var/aem/remote/install/aem-packages/*.zip /opt/aem/author/crx-quickstart/install/

EXPOSE ${AEM_PORT} 80

# set start dir to remote path:
WORKDIR /var/aem/remote

# start from local volume:
CMD ["/opt/aem/author/crx-quickstart/bin/start"]

#besure to remove install directories
