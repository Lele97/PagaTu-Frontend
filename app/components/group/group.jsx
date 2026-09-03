import { lazy, Suspense } from 'react';
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';
import Header from '../header/header.jsx';
import GroupHeader from '../group/groupHeader.jsx';
import PaymentActions from '../group/paymentActions.jsx';
import PaymentCards from '../group/paymentCards.jsx';
import GroupStatsSection from '~/components/group/GroupStatsSection.jsx';
import GroupInfoSection from '~/components/group/GroupInfoSection.jsx';
import SectionReveal from '~/components/shared/SectionReveal.jsx';
import CoffeePatternIcons from '~/components/shared/CoffeePatternIcons.jsx';
import { memberDisplayName } from '~/utils/groupHelpers';
import useGroupPage from '~/hooks/useGroupPage.js';

const RegisterPaymentModal = lazy(() => import('../group/modals/RegisterPaymentModal.jsx'));
const DeleteGroupModal = lazy(() => import('~/components/group/modals/DeleteGroupModal.jsx'));
const InviteUserModal = lazy(() => import('~/components/group/modals/InviteUserModal.jsx'));
const SkipPaymentModal = lazy(() => import('~/components/group/modals/SkipPaymentModal.jsx'));
const PayForFriendModal = lazy(() => import('~/components/group/modals/PayForFriendModal.jsx'));
const UserSettingsModal = lazy(() => import('~/components/settings/modals/UserSettingsModal.jsx'));
const GroupSettingsModal = lazy(() => import('~/components/settings/modals/GroupSettingsModal.jsx'));

const Group = () => {
    const page = useGroupPage();
    const hasMembers = Boolean(page.groups?.userMembershipsdto?.length);
    const anyModalOpen = page.isAnyModalOpen;

    return (
        <div className={styles.groupPage}>
            <CoffeePatternIcons />

            <div className={styles.container}>
                <Header
                    user={page.user}
                    logout={page.logout}
                    showGroupSettings={page.isAdmin}
                    avatarKey={page.avatarKey}
                />

                <main className={styles.main}>
                    <GroupHeader
                        group={page.group}
                        currentUser={page.user}
                        onGoBack={page.goBack}
                        isAdmin={page.isAdmin}
                        onOpenSettings={page.openGroupSettings}
                    />

                    <div className={styles.groupGridLayout}>
                        <div className={styles.groupMainCol}>
                            <SectionReveal>
                                {page.groupSummaryLoading && !hasMembers ? (
                                    <section className={styles.groupInfoSection}>
                                        <p className={sharedStyles.summaryText}>Caricamento turno...</p>
                                    </section>
                                ) : (
                                    <GroupInfoSection
                                        group={page.groups}
                                        currentUser={page.user}
                                        showLeave={!page.isAdmin}
                                        onLeaveGroup={page.handleLeaveGroup}
                                        leavingGroup={page.leavingGroup}
                                    />
                                )}
                            </SectionReveal>

                            <SectionReveal>
                                <PaymentCards
                                    loading={page.paymentLoading}
                                    error={page.paymentByGroupError}
                                    payments={page.classificaPaymentsForGroup}
                                    onRetry={page.onRetry}
                                />
                            </SectionReveal>

                            <GroupStatsSection
                                groupName={page.group?.groupName}
                                refreshToken={page.statsRevision}
                            />
                        </div>

                        <aside className={styles.groupSidebar}>
                            <SectionReveal>
                                <PaymentActions
                                    myTurn={page.myTurn}
                                    canPayFor={page.canPayFor}
                                    maxSkipPerMonth={page.groups.maxSkipPerMonth ?? 4}
                                    maxPayForPerMonth={page.groups.maxPayForPerMonth ?? 4}
                                    myMembership={page.myMembership}
                                    currentTurnUsername={page.groups.currentTurnUsername || page.currentTurnMember?.username}
                                    currentTurnDisplayName={page.currentTurnMember ? memberDisplayName(page.currentTurnMember) : null}
                                    onRegisterPayment={page.registerPayment}
                                    onSkipPayment={page.skipPayment}
                                    onPayForFriend={page.payForFriend}
                                    paidCount={page.groups.roundPaidCount ?? 0}
                                    pendingCount={page.groups.roundPendingCount ?? 0}
                                />
                            </SectionReveal>
                        </aside>
                    </div>
                </main>
            </div>

            {anyModalOpen && (
                <Suspense fallback={null}>
                    {page.userSettingsOpen && <UserSettingsModal />}

                    {page.groupSettingsOpen && (
                        <GroupSettingsModal
                            groupName={page.group?.groupName}
                            isAdmin={page.isAdmin}
                            onInviteMember={page.inviteMember}
                            onDeleteGroup={page.deleteGroup}
                            onSettingsSaved={page.handleSettingsSaved}
                        />
                    )}

                    {page.showInviteForm && (
                        <InviteUserModal
                            closeInviteForm={page.closeInviteForm}
                            submitInvite={page.submitInvite}
                            userInvitation={page.userInvitation}
                            isSubmitting={page.isSubmitting}
                            error={page.error}
                            successMessage={page.successMessage}
                            handleInputChangeInvitation={page.handleInputChangeInvitation}
                        />
                    )}

                    {page.showPayForFriendModal && (
                        <PayForFriendModal
                            closePayForFriendModal={page.closePayForFriendModal}
                            handleInputChangeImporto={page.handleInputChangeImporto}
                            confirmPayForFriend={page.confirmPayForFriend}
                            importo={page.importo}
                            descrizione={page.descrizione}
                            handleInputChangeDescrizione={page.handleInputChangeDescrizione}
                            isSubmitting={page.isSubmitting}
                            error={page.error}
                            friend={page.friend}
                            successMessage={page.successMessage}
                        />
                    )}

                    {page.showRegisterPaymentModal && (
                        <RegisterPaymentModal
                            submitPayment={page.submitPayment}
                            importo={page.importo}
                            descrizione={page.descrizione}
                            error={page.error}
                            successMessage={page.successMessage}
                            isSubmitting={page.isSubmitting}
                            closeRegisterPaymentModal={page.closeRegisterPaymentModal}
                            handleInputChangeImporto={page.handleInputChangeImporto}
                            handleInputChangeDescrizione={page.handleInputChangeDescrizione}
                        />
                    )}

                    {page.showDeleteModal && (
                        <DeleteGroupModal
                            groupName={page.group?.groupName || 'Unnamed Group'}
                            closeDeleteModal={page.closeDeleteModal}
                            confirmDeleteGroup={page.confirmDeleteGroup}
                            isDeleting={page.isDeleting}
                            error={page.error}
                            successMessage={page.successMessage}
                        />
                    )}

                    {page.showSaltaPaymentModal && (
                        <SkipPaymentModal
                            closeSaltaPaymentForm={page.closeSaltaPaymentForm}
                            confirmSkipPayment={page.confirmSkipPayment}
                            isSkipping={page.isSkipping}
                            error={page.error}
                            successMessage={page.successMessage}
                        />
                    )}
                </Suspense>
            )}
        </div>
    );
};

export default Group;
