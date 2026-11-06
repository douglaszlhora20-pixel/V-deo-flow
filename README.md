# VideoFlow V1 — MVP funcional

## O que funciona agora
- Cadastro local de produtos
- Biblioteca de produtos
- Cadastro de vídeos
- Prompt, legenda e hashtags salvos por vídeo
- Fila diária
- Marcar vídeo como publicado
- Resultados básicos
- Meta diária
- Persistência local no celular com AsyncStorage

## Como testar
1. Instale Node.js e Expo.
2. Execute `npm install`
3. Execute `npx expo start`
4. Abra no Expo Go.

## Banco real (Supabase)
O projeto inclui `supabase-schema.sql` e uma camada preparada para sincronização.
A versão inicial funciona mesmo sem Supabase, usando armazenamento local.
