cmake_minimum_required(VERSION 3.15)
project(psi_algorithm VERSION 0.1.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Find OpenSSL
find_package(OpenSSL REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
include_directories(${OPENSSL_INCLUDE_DIR})

# Source files
set(SOURCES
    src/psi.cpp
)

# Header files
set(HEADERS
    include/psi.h
)

# Create shared library
add_library(psi_algorithm SHARED ${SOURCES} ${HEADERS})
target_link_libraries(psi_algorithm ${OPENSSL_LIBRARIES})

# Set output directory
set_target_properties(psi_algorithm PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
)

# Create test executable
add_executable(test_psi src/test_psi.cpp)
target_link_libraries(test_psi psi_algorithm ${OPENSSL_LIBRARIES})

# Install targets
install(TARGETS psi_algorithm
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)

# Install headers
install(FILES ${HEADERS} DESTINATION include/psi_algorithm)

# Add tests if testing is enabled
option(BUILD_TESTS "Build tests" OFF)
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif() 