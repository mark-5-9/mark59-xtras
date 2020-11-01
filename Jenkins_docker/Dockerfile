FROM openjdk:8-jdk-stretch


# ########################################################################################################################
# Hack to an official jenkins/jenkins dockerfile to allow a saved copy of jenkins_home to be inserted in image
#
# Usage :
# to save changes copy the container's jenkins_home over the top of the original jenkins_home:  eg
#
#     docker cp mark59-wip_jenkins_1:/var/jenkins_home ~/gitrepo/mark59-xtras/docker/jenkins_home
# 
# then locally delete and rebuild the image.  eg  
# 
#     docker build -t mark59/jenkins .         
#
# ########################################################################################################################


# Install git lfs on Debian stretch per https://github.com/git-lfs/git-lfs/wiki/Installation#debian-and-ubuntu
# Avoid JENKINS-59569 - git LFS 2.7.1 fails clone with reference repository
RUN apt-get update && apt-get upgrade -y && apt-get install -y git curl && curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && apt-get install -y git-lfs && git lfs install && rm -rf /var/lib/apt/lists/*

ARG user=jenkins
ARG group=jenkins
ARG uid=1000
ARG gid=1000
ARG http_port=8080
ARG agent_port=50000
ARG JENKINS_HOME=/var/jenkins_home
ARG REF=/usr/share/jenkins/ref

ENV JENKINS_HOME $JENKINS_HOME
ENV JENKINS_SLAVE_AGENT_PORT ${agent_port}
ENV REF $REF

# Jenkins is run with user `jenkins`, uid = 1000
# If you bind mount a volume from the host or a data container,
# ensure you use the same uid
RUN mkdir -p $JENKINS_HOME \
  && chown ${uid}:${gid} $JENKINS_HOME \
  && groupadd -g ${gid} ${group} \
  && useradd -d "$JENKINS_HOME" -u ${uid} -g ${gid} -m -s /bin/bash ${user}

# Jenkins home directory is a volume, so configuration and build history
# can be persisted and survive image upgrades

# ########################################################################################################################
# >> Mark59 - hack to use a stored jenkins home - remove the named volumed and (later in the dockerfile)replace with a jenkins_home copied from external directory
# VOLUME $JENKINS_HOME
# ########################################################################################################################


# $REF (defaults to `/usr/share/jenkins/ref/`) contains all reference configuration we want
# to set on a fresh new installation. Use it to bundle additional plugins
# or config file with your custom jenkins Docker image.
RUN mkdir -p ${REF}/init.groovy.d

# Use tini as subreaper in Docker container to adopt zombie processes
ARG TINI_VERSION=v0.16.1
COPY tini_pub.gpg ${JENKINS_HOME}/tini_pub.gpg
RUN curl -fsSL https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static-$(dpkg --print-architecture) -o /sbin/tini \
  && curl -fsSL https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static-$(dpkg --print-architecture).asc -o /sbin/tini.asc \
  && gpg --no-tty --import ${JENKINS_HOME}/tini_pub.gpg \
  && gpg --verify /sbin/tini.asc \
  && rm -rf /sbin/tini.asc /root/.gnupg \
  && chmod +x /sbin/tini

# jenkins version being bundled in this docker image
ARG JENKINS_VERSION
ENV JENKINS_VERSION ${JENKINS_VERSION:-2.249.1}

# jenkins.war checksum, download will be validated using it
ARG JENKINS_SHA=33a6c3161cf8de9c8729fd83914d781319fd1569acf487c7b1121681dba190a5

# Can be used to customize where jenkins.war get downloaded from
ARG JENKINS_URL=https://repo.jenkins-ci.org/public/org/jenkins-ci/main/jenkins-war/${JENKINS_VERSION}/jenkins-war-${JENKINS_VERSION}.war

# could use ADD but this one does not check Last-Modified header neither does it allow to control checksum
# see https://github.com/docker/docker/issues/8331
# RUN curl -fsSL ${JENKINS_URL} -o /usr/share/jenkins/jenkins.war \
#  && echo "${JENKINS_SHA}  /usr/share/jenkins/jenkins.war" | sha256sum -c -

RUN curl -fsSL ${JENKINS_URL} -o /usr/share/jenkins/jenkins.war && echo "${JENKINS_SHA}  /usr/share/jenkins/jenkins.war"


ENV JENKINS_UC https://updates.jenkins.io
ENV JENKINS_UC_EXPERIMENTAL=https://updates.jenkins.io/experimental
ENV JENKINS_INCREMENTALS_REPO_MIRROR=https://repo.jenkins-ci.org/incrementals
RUN chown -R ${user} "$JENKINS_HOME" "$REF"

ARG PLUGIN_CLI_URL=https://github.com/jenkinsci/plugin-installation-manager-tool/releases/download/2.1.0/jenkins-plugin-manager-2.1.0.jar
RUN curl -fsSL ${PLUGIN_CLI_URL} -o /usr/lib/jenkins-plugin-manager.jar

# for main web interface:
EXPOSE ${http_port}

# will be used by attached slave agents:
EXPOSE ${agent_port}

ENV COPY_REFERENCE_FILE_LOG $JENKINS_HOME/copy_reference_file.log

USER ${user}

COPY jenkins-support /usr/local/bin/jenkins-support
COPY jenkins.sh /usr/local/bin/jenkins.sh
COPY tini-shim.sh /bin/tini
COPY jenkins-plugin-cli.sh /bin/jenkins-plugin-cli

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/jenkins.sh"]

# from a derived Dockerfile, can use `RUN install-plugins.sh active.txt` to setup ${REF}/plugins from a support bundle
COPY install-plugins.sh /usr/local/bin/install-plugins.sh


# ##################################################################################################################
# Additional Mark59 specific entries 
# ##################################################################################################################

USER root

RUN apt-get update && apt-get clean

# Set the Chrome repo.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list

# Install Chrome.
RUN apt-get update && apt-get -y install google-chrome-stable

# Install mpstat command  
RUN apt-get update && apt-get -y install sysstat

# Now, copy the external jekins_home into the image
COPY ./jenkins_home /var/jenkins_home/
RUN chmod -R 777 /var/jenkins_home/

RUN echo "Australia/Melbourne" > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata

USER jenkins

