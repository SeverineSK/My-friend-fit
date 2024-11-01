import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Share, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir ce package installé

const RecipeDetailScreen = ({ route }) => {
    const { recipe } = route.params;
    const [translatedRecipe, setTranslatedRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const translateRecipe = async () => {
            const apiKey = 'AIzaSyB0FjLVbLD2tj5xFuIm8i2-Kzxcy2yS8s0'; // Votre clé API Google Translate
            const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: [recipe.recipe.label, ...recipe.recipe.ingredientLines],
                        target: 'fr',
                        format: 'text',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const translatedTexts = data.data.translations;

                setTranslatedRecipe({
                    ...recipe,
                    recipe: {
                        ...recipe.recipe,
                        label: translatedTexts[0].translatedText,
                        ingredientLines: translatedTexts.slice(1).map(text => text.translatedText),
                    }
                });
            } catch (err) {
                console.error('Error translating recipe:', err);
                setError('Error translating recipe');
            } finally {
                setLoading(false);
            }
        };

        translateRecipe();
    }, [recipe]);

    const shareRecipe = async () => {
        try {
            await Share.share({
                message: `Check out this recipe: ${translatedRecipe.recipe.label}\n\nIngredients:\n${translatedRecipe.recipe.ingredientLines.join('\n')}\n\nCalories: ${Math.round(translatedRecipe.recipe.calories)}\n\nImage: ${translatedRecipe.recipe.image}`,
            });
        } catch (error) {
            console.error('Error sharing recipe:', error);
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    if (!translatedRecipe) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{translatedRecipe.recipe.label}</Text>
            {translatedRecipe.recipe.image && (
                <Image
                    source={{ uri: translatedRecipe.recipe.image }}
                    style={styles.image}
                />
            )}
            <View style={styles.ingredientsContainer}>
                <Text style={styles.subtitle}>Ingredients:</Text>
                {translatedRecipe.recipe.ingredientLines.map((ingredient, index) => (
                    <Text key={index} style={styles.ingredient}>{ingredient}</Text>
                ))}
            </View>
            <Text style={styles.subtitle}>Calories: {Math.round(translatedRecipe.recipe.calories)}</Text>
            <View style={styles.shareContainer}>
                <TouchableOpacity style={styles.shareButton} onPress={shareRecipe}>
                    <Ionicons name="share-outline" size={24} color="white" />
                    <Text style={styles.shareText}>Partager</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 16,
        borderRadius: 8,
    },
    ingredientsContainer: {
        backgroundColor: '#DFD0D0',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    ingredient: {
        fontSize: 16,
        marginVertical: 4,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 16,
    },
    shareContainer: {
        backgroundColor: '#DFD0D0',
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#DFD0D0',
    },
    shareText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 8,
    },
});

export default RecipeDetailScreen;
