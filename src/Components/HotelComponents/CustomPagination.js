import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLOR } from "../../Config/AppStyling";

const CustomPagination = ({ totalItems, pageSize, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const renderPage = (page) => {
    const isActive = page === currentPage;
    return (
      <TouchableOpacity
        key={page}
        style={[styles.page, isActive && styles.activePage]}
        onPress={() => onPageChange(page)}
      >
        <Text style={[styles.pageText, isActive && styles.activePageText]}>
          {page}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPages = () => {
    let pages = [];

    if (totalPages <= 6) {
      // show all if small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPage(i));
      }
    } else {
      if (currentPage <= 3) {
        // show first 3 + ... + last
        pages.push(renderPage(1));
        pages.push(renderPage(2));
        pages.push(renderPage(3));
        pages.push(<Text key="ellipsis" style={styles.ellipsis}>...</Text>);
        pages.push(renderPage(totalPages));
      } else if (currentPage >= totalPages - 2) {
        // show 1 + ... + last 3
        pages.push(renderPage(1));
        pages.push(<Text key="ellipsis" style={styles.ellipsis}>...</Text>);
        pages.push(renderPage(totalPages - 2));
        pages.push(renderPage(totalPages - 1));
        pages.push(renderPage(totalPages));
      } else {
        // show 1 + ... + current-1, current, current+1 + ... + last
        pages.push(renderPage(1));
        pages.push(<Text key="ellipsisLeft" style={styles.ellipsis}>...</Text>);
        pages.push(renderPage(currentPage - 1));
        pages.push(renderPage(currentPage));
        pages.push(renderPage(currentPage + 1));
        pages.push(<Text key="ellipsisRight" style={styles.ellipsis}>...</Text>);
        pages.push(renderPage(totalPages));
      }
    }

    return pages;
  };

  return (
    <View style={styles.container}>
      {/* Prev Arrow */}
      <TouchableOpacity
        style={[styles.arrow, currentPage === 1 && styles.disabled]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={styles.arrowText}>{"‹"}</Text>
      </TouchableOpacity>

      {renderPages()}

      {/* Next Arrow */}
      <TouchableOpacity
        style={[styles.arrow, currentPage === totalPages && styles.disabled]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text style={styles.arrowText}>{"›"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    flexWrap: "wrap",
  },
  arrow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 4,
    backgroundColor: COLOR.PRIMARY,
    borderRadius: 6,
  },
  arrowText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  disabled: {
    backgroundColor: "#ccc",
  },
  page: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 2,
  },
  activePage: {
    backgroundColor: COLOR.PRIMARY,
  },
  pageText: {
    color: "#333",
    fontWeight: "500",
    fontSize:18
  },
  activePageText: {
    color: "#fff",
    fontWeight: "700",
  },
  ellipsis: {
    marginHorizontal: 6,
    fontSize: 16,
    color: "#555",
  },
});

export default CustomPagination;
