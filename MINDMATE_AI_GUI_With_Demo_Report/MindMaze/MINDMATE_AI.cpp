// MINDMATE AI - Simple C++ backend for the website
// Dev-C++ on Windows. Compile with -lws2_32 (C++11).
// Only two simple classes: Assessment and WebServer.
// Scores describe self-reported difficulty, NOT medical diagnoses.
#define _WIN32_WINNT 0x0601
#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cstdlib>
using namespace std;

class Assessment {
public:
    int answers[10];
    Assessment() { for (int i=0;i<10;i++) answers[i]=-1; }
    // For positive questions, 4 is best and 0 is most difficult.
    // Questions 3 and 4 describe stress/anxiety: 4 is most difficult.
    // Question 10 is a separate safety flag; never added to a score.
    int difficulty(int i) {
        if (answers[i]<0) return -1;
        if (i==2 || i==3) return answers[i];
        return 4-answers[i];
    }
    int category(int c) {
        // 0 Mood (Q1,Q2); 1 Stress (Q3,Q4); 2 Rest (Q5,Q6);
        // 3 Focus (Q7,Q9); 4 Connection (Q8).
        int a[5]={0,2,4,6,7};
        int b[5]={1,3,5,8,-1};
        int total=0, n=0;
        if (answers[a[c]]>=0) {total+=difficulty(a[c]);n++;}
        if (b[c]>=0 && answers[b[c]]>=0) {total+=difficulty(b[c]);n++;}
        return n==0?-1:(total*25/n); // 0-100 reported difficulty
    }
    int total() {
        int sum=0,n=0;
        for(int i=0;i<9;i++) if(answers[i]>=0){sum+=difficulty(i);n++;}
        return n==0?-1:sum*25/n;
    }
    bool parse(string body) {
        // The browser sends ten comma-separated integers, -1 for skipped.
        // Q10: 1 = yes, 0 = no, -1 = prefer not to answer.
        istringstream in(body);
        for(int i=0;i<10;i++) {
            if(!(in>>answers[i])) return false;
            if(i<9 && (answers[i]<-1 || answers[i]>4)) return false;
            if(i==9 && (answers[i]<-1 || answers[i]>1)) return false;
            if(i<9){char comma;if(!(in>>comma)||comma!=',')return false;}
        }
        string extra;if(in>>extra)return false;
        return true;
    }
    string result() {
        ostringstream out;
        out<<"{\"score\":"<<total()<<",\"categories\":[";
        for(int i=0;i<5;i++){if(i)out<<",";out<<category(i);}
        out<<"],\"safety\":"<<answers[9]<<"}";
        return out.str();
    }
};

class WebServer {
    string readFile(string path) {
        ifstream file(path.c_str(),ios::binary);
        if(!file)return "";
        ostringstream out;out<<file.rdbuf();return out.str();
    }
    string type(string path) {
        if(path.find(".css")!=string::npos)return "text/css";
        if(path.find(".js")!=string::npos)return "application/javascript";
        if(path.find(".json")!=string::npos)return "application/json";
        if(path.find(".svg")!=string::npos)return "image/svg+xml";
        return "text/html";
    }
    void reply(SOCKET client,int status,string mime,string body) {
        ostringstream out;
        out<<"HTTP/1.1 "<<status<<(status==200?" OK":" Bad Request")<<"\r\n";
        out<<"Content-Type: "<<mime<<"; charset=utf-8\r\n";
        out<<"Content-Length: "<<body.size()<<"\r\nConnection: close\r\n";
        out<<"X-Content-Type-Options: nosniff\r\nCache-Control: no-store\r\n\r\n";
        string msg=out.str()+body;
        size_t sent=0;
        while(sent<msg.size()){
            int n=send(client,msg.data()+sent,(int)(msg.size()-sent),0);
            if(n<=0)break;sent+=n;
        }
    }
    void handle(SOCKET client) {
        char buf[4096];string request;
        int n;
        while(request.find("\r\n\r\n")==string::npos && request.size()<16384) {
            n=recv(client,buf,sizeof(buf),0);if(n<=0)return;request.append(buf,n);
        }
        size_t end=request.find("\r\n\r\n");if(end==string::npos)return;
        string header=request.substr(0,end),body=request.substr(end+4);
        istringstream first(header);string method,path;first>>method>>path;
        int length=0;size_t pos=header.find("Content-Length:");
        if(pos==string::npos)pos=header.find("content-length:");
        if(pos!=string::npos)length=atoi(header.c_str()+pos+15);
        if(length<0 || length>4096){reply(client,400,"text/plain","Invalid request");return;}
        while((int)body.size()<length){n=recv(client,buf,sizeof(buf),0);if(n<=0)return;body.append(buf,n);}
        if(method=="POST" && path=="/api/assessment") {
            Assessment a;
            if(!a.parse(body)){reply(client,400,"application/json","{\"error\":\"Invalid answers\"}");return;}
            reply(client,200,"application/json",a.result());return;
        }
        if(method!="GET"){reply(client,400,"text/plain","Unsupported method");return;}
        if(path=="/")path="/app.html";
        if(path.find("..")!=string::npos || path.find('\\')!=string::npos || path.find('%')!=string::npos || path.find('?')!=string::npos) {
            reply(client,400,"text/plain","Invalid path");return;
        }
        string filePath;
        if(path.find("/data/")==0)filePath="data/"+path.substr(6);
        else filePath="frontend"+path;
        string content=readFile(filePath);
        if(content.empty()){reply(client,404,"text/plain","File not found");return;}
        reply(client,200,type(path),content);
    }
public:
    void run() {
        WSADATA wsa;if(WSAStartup(MAKEWORD(2,2),&wsa)!=0){cout<<"Winsock error\n";return;}
        SOCKET server=socket(AF_INET,SOCK_STREAM,IPPROTO_TCP);
        if(server==INVALID_SOCKET){WSACleanup();return;}
        sockaddr_in addr={};addr.sin_family=AF_INET;addr.sin_port=htons(8080);
        addr.sin_addr.s_addr=inet_addr("127.0.0.1");
        if(bind(server,(sockaddr*)&addr,sizeof(addr))==SOCKET_ERROR || listen(server,5)==SOCKET_ERROR){
            cout<<"Could not start. Is port 8080 already in use?\n";closesocket(server);WSACleanup();return;
        }
        cout<<"MINDMATE AI running at http://127.0.0.1:8080\n";
        cout<<"Keep this window open. Press Ctrl+C to stop.\n";
        while(true){SOCKET client=accept(server,NULL,NULL);if(client!=INVALID_SOCKET){handle(client);closesocket(client);}}
    }
};
int main(){WebServer app;app.run();return 0;}
