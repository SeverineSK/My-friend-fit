import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

const cleanText = (str) => {
    const normalizedStr = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizedStr
        .replace(/&/g, 'and')
        .replace(/'/g, '’')
        .replace(/["]/g, '“')
        .replace(/['"]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '');
};

const translateText = async (texts) => {
    const apiKey = 'AIzaSyB0FjLVbLD2tj5xFuIm8i2-Kzxcy2yS8s0'; 
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: texts,
                target: 'fr',
                format: 'text',
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.data.translations.map(translation => translation.translatedText);
    } catch (err) {
        console.error('Error translating texts:', err);
        return texts; 
    }
};

const FoodScreen = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecipes, setTotalRecipes] = useState(0); 

    useEffect(() => {
       
        fetchRecipes(page);
    }, []);

    const fetchRecipes = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const appId = '76132ca5'; 
            const appKey = '4d998b632f8d50cff743cb8ebc6d3b8d'; 
            const from = (page - 1) * 10;
            const url = `https://api.edamam.com/search?q=recipe&app_id=${appId}&app_key=${appKey}&from=${from}&to=${from + 10}`;

            console.log('Fetching URL:', url);
            const response = await fetch(url);
            if (!response.ok) {
                console.log('Response Status:', response.status);
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Fetched Data:', data);

            if (data.hits && data.hits.length > 0) {
                const total = data.count;
                setTotalRecipes(total);
                setTotalPages(Math.ceil(total / 10));

                const sortedRecipes = data.hits.sort((a, b) => {
                    const labelA = cleanText(a.recipe.label).toUpperCase();
                    const labelB = cleanText(b.recipe.label).toUpperCase();
                    return labelA.localeCompare(labelB);
                });

                const labels = sortedRecipes.map(recipe => recipe.recipe.label);
                const translatedLabels = await translateText(labels);

                const updatedRecipes = sortedRecipes.map((recipe, index) => ({
                    ...recipe,
                    recipe: {
                        ...recipe.recipe,
                        label: translatedLabels[index],
                    }
                }));

                setRecipes(updatedRecipes);
                setFilteredRecipes(updatedRecipes);
            } else {
                setRecipes([]);
                setFilteredRecipes([]);
                setError('No recipes found');
            }
        } catch (err) {
            console.error('Error details:', err);
            setError('Error fetching recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setQuery(text);
        if (text) {
            const searchLower = text.toLowerCase();
            setFilteredRecipes(
                recipes.filter(recipe =>
                    cleanText(recipe.recipe.label).toLowerCase().startsWith(searchLower)
                )
            );
        } else {
            setFilteredRecipes(recipes);
        }
    };

    const handlePressRecipe = (recipe) => {
        navigation.navigate('RecipeDetailScreen', { recipe });
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchRecipes(nextPage);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            const prevPage = page - 1;
            setPage(prevPage);
            fetchRecipes(prevPage);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rechercher des recettes saines</Text>
            <TouchableOpacity style={styles.button} onPress={() => fetchRecipes(page)}>
                <Text style={styles.buttonText}>Afficher toutes les recettes</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="Rechercher une recette..."
                value={query}
                onChangeText={handleSearch}
            />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>}
            <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.recipe.uri}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePressRecipe(item)} style={styles.item}>
                        <Text style={styles.itemTitle}>{item.recipe.label || 'Unknown'}</Text>
                        <Text>{item.recipe.calories ? `Calories: ${Math.round(item.recipe.calories)} kcal` : 'No nutritional information'}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyList}>Aucune recette trouvée</Text>}
            />
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={styles.paginationButton}
                    onPress={handlePreviousPage}
                    disabled={page === 1}
                >
                    <Text style={styles.paginationButtonText}>Précédent</Text>
                </TouchableOpacity>
                <Text>Page {page} sur {totalPages}</Text>
                <TouchableOpacity
                    style={styles.paginationButton}
                    onPress={handleNextPage}
                    disabled={page === totalPages}
                >
                    <Text style={styles.paginationButtonText}>Suivant</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#DFD0D0',
        borderWidth: 1,
        marginBottom: 12,
        padding: 8,
    },
    button: {
        backgroundColor: '#DFD0D0',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#DFD0D0',
        width: '100%',
        backgroundColor: '#f9f9f9',
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 16,
    },
    emptyList: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    paginationButton: {
        backgroundColor: '#DFD0D0',
        padding: 10,
        borderRadius: 5,
    },
    paginationButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});

export default FoodScreen;
