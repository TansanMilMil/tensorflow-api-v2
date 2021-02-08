FROM centos:8
COPY . /express
RUN yum install -y python3 && \
    yum install -y epel-release && \
    yum install -y make && \
    yum install -y gcc-c++ && \
    yum install -y nodejs npm && \
    cd /express && \
    npm install --production
EXPOSE 3000
CMD ["/express/start.sh"]