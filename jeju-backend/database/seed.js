const { userQueries, postQueries, commentQueries, likeQueries } = require('./db');

async function seedDatabase() {
    try {
        console.log('샘플 데이터 삽입을 시작합니다...');
        
        // 샘플 사용자 생성
        const users = [
            {
                email: 'admin@jeju.sns',
                displayName: 'JeJu 관리자',
                username: '@jejuadmin',
                password: 'admin123'
            },
            {
                email: 'citizen@jeju.sns',
                displayName: '제주시민',
                username: '@jejucitizen',
                password: 'citizen123'
            },
            {
                email: 'realtor@jeju.sns',
                displayName: '제주부동산',
                username: '@jejurealty',
                password: 'realtor123'
            },
            {
                email: 'tour@jeju.sns',
                displayName: '제주여행사',
                username: '@jejutour',
                password: 'tour123'
            }
        ];
        
        const createdUsers = [];
        for (const userData of users) {
            try {
                const user = await userQueries.createUser(
                    userData.email,
                    userData.displayName,
                    userData.username,
                    userData.password
                );
                createdUsers.push(user);
                console.log(`사용자 생성: ${user.display_name}`);
            } catch (error) {
                console.log(`사용자 ${userData.email} 이미 존재함`);
                const existingUser = await userQueries.findByEmail(userData.email);
                createdUsers.push(existingUser);
            }
        }
        
        // 샘플 게시글 생성
        const posts = [
            {
                userId: createdUsers[1].id, // 제주시민
                content: '제주시청에서 청년 창업 지원금 신청 받고 있어요! 최대 500만원까지 지원합니다. 신청 방법은 제주시청 홈페이지에서 확인하세요.',
                category: 'policy'
            },
            {
                userId: createdUsers[2].id, // 제주부동산
                content: '서귀포시 중문동 투룸 전세 매물 나왔습니다. 보증금 8천만원, 월세 50만원, 바다 전망 좋은 곳이에요. 문의는 064-123-4567',
                category: 'realestate'
            },
            {
                userId: createdUsers[3].id, // 제주여행사
                content: '이번 주말 한라산 등반 가이드 구합니다. 경력 3년 이상, 안전교육 이수자 우대. 일당 15만원입니다. 연락처: 010-1234-5678',
                category: 'jobs'
            },
            {
                userId: createdUsers[1].id, // 제주시민
                content: '제주 올레길 1코스 걷기 모임 있습니다. 이번 주 토요일 오전 9시 제주시청 앞에서 출발합니다. 누구나 참여 가능해요!',
                category: 'events'
            },
            {
                userId: createdUsers[0].id, // 관리자
                content: '제주도 코로나19 현황: 신규 확진자 5명, 누적 확진자 1,234명입니다. 방역 수칙을 잘 지켜주세요.',
                category: 'news'
            }
        ];
        
        const createdPosts = [];
        for (const postData of posts) {
            const post = await postQueries.createPost(
                postData.userId,
                postData.content,
                postData.category
            );
            createdPosts.push(post);
            console.log(`게시글 생성: ${post.content.substring(0, 30)}...`);
        }
        
        // 샘플 댓글 생성
        const comments = [
            {
                postId: createdPosts[0].id,
                userId: createdUsers[2].id,
                content: '어떻게 신청하나요? 구체적인 방법 알려주세요!'
            },
            {
                postId: createdPosts[0].id,
                userId: createdUsers[3].id,
                content: '좋은 정보 감사합니다! 청년들에게 도움이 될 것 같아요.'
            },
            {
                postId: createdPosts[1].id,
                userId: createdUsers[1].id,
                content: '중문동이면 관광객이 많을 것 같은데, 조용한가요?'
            },
            {
                postId: createdPosts[2].id,
                userId: createdUsers[1].id,
                content: '등반 경험은 없지만 관심이 많아요. 초보자도 가능한가요?'
            },
            {
                postId: createdPosts[3].id,
                userId: createdUsers[2].id,
                content: '올레길 걷기 좋은 날씨네요! 참여하고 싶어요.'
            }
        ];
        
        for (const commentData of comments) {
            const comment = await commentQueries.createComment(
                commentData.postId,
                commentData.userId,
                commentData.content
            );
            console.log(`댓글 생성: ${comment.content.substring(0, 20)}...`);
        }
        
        // 샘플 좋아요 생성
        const likes = [
            { postId: createdPosts[0].id, userId: createdUsers[2].id },
            { postId: createdPosts[0].id, userId: createdUsers[3].id },
            { postId: createdPosts[1].id, userId: createdUsers[1].id },
            { postId: createdPosts[2].id, userId: createdUsers[1].id },
            { postId: createdPosts[3].id, userId: createdUsers[2].id },
            { postId: createdPosts[4].id, userId: createdUsers[1].id },
            { postId: createdPosts[4].id, userId: createdUsers[2].id },
            { postId: createdPosts[4].id, userId: createdUsers[3].id }
        ];
        
        for (const likeData of likes) {
            await likeQueries.addLike(likeData.postId, likeData.userId);
            console.log(`좋아요 추가: 게시글 ${likeData.postId} - 사용자 ${likeData.userId}`);
        }
        
        console.log('샘플 데이터 삽입이 완료되었습니다!');
        console.log(`- 사용자: ${createdUsers.length}명`);
        console.log(`- 게시글: ${createdPosts.length}개`);
        console.log(`- 댓글: ${comments.length}개`);
        console.log(`- 좋아요: ${likes.length}개`);
        
    } catch (error) {
        console.error('샘플 데이터 삽입 오류:', error);
    } finally {
        process.exit(0);
    }
}

seedDatabase(); 