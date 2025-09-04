<template>
    <div class="w-80 block">
        <div class="popup-background-pr shadow-2xl rounded-xl leading-normal">
            <PanelHeader v-bind:title="$t('labels.leave_reaction')"></PanelHeader>
            <div class="grid grid-cols-6 gap-2 p-4 max-h-72 overflow-y-auto">
                <div v-bind:title="emojiItem.unified" v-on:click="addReaction(emojiItem.unified)" class="cursor-pointer hover:scale-110 transition-all ease-linear" v-for="emojiItem in reactionsList" v-bind:key="emojiItem.unified">
                    <img class="w-full" v-bind:src="getEmojiUrl(emojiItem.image)" loading="lazy" alt="Reaction">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { defineComponent, onMounted, ref } from 'vue';
    import { smileysAndEmotionEmojis } from '@/assets/emojis/apple/categories/smileys-and-emotions.js';
    import PanelHeader from '@D/components/inter-ui/popups/parts/PanelHeader.vue';

    export default defineComponent({
        emits: ['add'],
        setup: function(_, context) {
            var reactionsList = ref([]);

            onMounted(() => {
                reactionsList.value = smileysAndEmotionEmojis.emojis;
            });

            return {
                reactionsList: reactionsList,
                getEmojiUrl: (image) => {
                    return embedder('links.assets.emoji') + "/" + image;
                },
                addReaction: (reactionId) => {
                    context.emit('add', reactionId);
                }
            }
        },
        components: {
            PanelHeader: PanelHeader
        }
    });
</script>