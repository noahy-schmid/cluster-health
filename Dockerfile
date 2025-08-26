FROM gradle:jdk23-alpine AS build

WORKDIR /app

COPY . .

RUN ./gradlew shadowJar

FROM openjdk:23-jdk-slim

COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080
EXPOSE 8081

CMD ["java", "-jar", "/app/app.jar"]